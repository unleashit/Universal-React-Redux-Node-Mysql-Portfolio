import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LiveChat from './liveChat';
import * as chatActions from './actions/liveChat';
import io from 'socket.io-client';
import { ionSound } from '../../../libs/ion-sound';
import {
    __API_URL__,
    __SOCKET_IO_URL__,
} from '../../../../../config/APPconfig';

export class LiveChatContainer extends Component {
    constructor(props) {
        super(props);
        this.socketConnect = this.socketConnect.bind(this);
        this.socketAdminConnected = this.socketAdminConnected.bind(this);
        this.socketAdminDisconnected = this.socketAdminDisconnected.bind(this);
        this.socketChatmessage = this.socketChatmessage.bind(this);
        this.socketTyping = this.socketTyping.bind(this);
        this.socketDisconnect = this.socketDisconnect.bind(this);
    }

    componentDidMount() {
        this.socket = io(__SOCKET_IO_URL__);
        this.socket.on('connect', this.socketConnect);
        this.socket.on('chatConnected', this.socketAdminConnected);
        this.socket.on('chatDisconnected', this.socketAdminDisconnected);
        this.socket.on('chatMessage', this.socketChatmessage);
        this.socket.on('typing', this.socketTyping);
        this.socket.on('disconnect', this.socketDisconnect);

        this.ionSound = ionSound();
        this.ionSound.sound({
            sounds: [{ name: 'water_droplet_3' }],
            volume: 0.5,
            path: '/sounds/',
            preload: true,
        });
    }

    componentWillUnmount() {
        clearTimeout(this.typingTimer);
    }

    socketConnect() {
        // console.log("socket id: " + this.socket.id);

        this.socket.emit('chatConnected', {}, (admin) => {
            if (admin) {
                // admin is online
                this.props.dispatch(
                    chatActions.chatSetRemoteId(admin.id, admin.name)
                );
                // console.log('Chat is online');
            }
            if (!this.props.liveChat.serverStatus) {
                // let the app know server is online
                this.props.dispatch(chatActions.chatSetServerStatus(true));
            }
        });
    }

    socketChatmessage(message) {
        if (message.id !== this.props.liveChat.room) {
            clearTimeout(this.typingTimer);
            this.props.dispatch(chatActions.chatIsTyping(false));
            this.ionSound.sound.play('water_droplet_3');

            // admin is active
            if (!this.props.liveChat.adminActive) {
                this.props.dispatch(chatActions.adminActive(true));
            }
        }
        this.props.dispatch(chatActions.chatReceiveMesssage(message));
    }

    socketTyping(id) {
        if (id === this.props.liveChat.remoteId) {
            clearTimeout(this.typingTimer);
            this.props.dispatch(chatActions.chatIsTyping(true));
            this.typingDelay();
        }
    }

    socketAdminConnected(admin) {
        if (admin) {
            this.props.dispatch(
                chatActions.chatSetRemoteId(admin.id, admin.name)
            );
        }
    }

    socketAdminDisconnected() {
        this.props.dispatch(chatActions.chatSetRemoteId('', ''));
    }

    socketDisconnect(message) {
        if (message === 'transport close') {
            // server disconnected
            this.props.dispatch(chatActions.chatSetServerStatus(false));
            this.props.dispatch(chatActions.chatSetRemoteId('', ''));
        }
    }

    newUser(e) {
        e.preventDefault();
        const name = e.currentTarget[0].value.trim();
        const email = e.currentTarget[1].value.trim();
        if (!name) return;

        // chat is offline, send email
        if (!this.props.liveChat.remoteId) {
            const message = e.currentTarget[2].value.trim();
            if (!email || !message) return;
            if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,24}$/i.test(email))
                return;

            const contactData = { name, email, message };

            return fetch(__API_URL__ + '/contact', {
                method: 'POST',
                body: JSON.stringify(contactData),
                headers: new Headers({
                    'Content-Type': 'application/json',
                }),
            })
                .then((response) => {
                    this.props.dispatch(chatActions.contactSent(true));
                    // console.log("contact sent");
                })
                .catch((err) => {
                    throw new Error(err);
                });
        } else {
            this.socket.emit(
                'newUser',
                {
                    id: this.socket.id,
                    name: name,
                    email: email,
                    connected: true,
                },
                (room) => {
                    this.props.dispatch(
                        chatActions.chatNewUser({
                            room: room,
                            name: name,
                            email: email,
                            registered: true,
                        })
                    );

                    this.setAdminTimer();
                }
            );
        }
    }

    setAdminTimer() {
        return (this.adminTimer = setTimeout(() => {
            if (!this.props.liveChat.adminActive) {
                const message = {
                    id: this.props.liveChat.room,
                    room: this.props.liveChat.room,
                    name: this.props.liveChat.remoteName,
                    message:
                        "It looks like it's taking me a while to reply. You're welcome to wait a bit longer," +
                        " or please leave a note along with your contact info if you haven't" +
                        ' already. I will see your messages and get in touch before you know it!',
                    date: Date.now(),
                };

                this.socket.emit('chatMessage', message);
            }
        }, 1000 * 60 * 4));
    }

    typingDelay() {
        return (this.typingTimer = setTimeout(() => {
            this.props.dispatch(chatActions.chatIsTyping(false));
        }, 1200));
    }

    onSubmit(e) {
        e.preventDefault();
        let chatInput = e.currentTarget[0].value.trim();
        if (!chatInput) return;
        const message = {
            id: this.props.liveChat.room,
            room: this.props.liveChat.room,
            name: this.props.liveChat.localName,
            message: chatInput,
            date: Date.now(),
        };
        this.socket.emit('chatMessage', message);
        this.props.dispatch(chatActions.chatCreateMesssage(''));
    }

    onChange(e) {
        this.socket.emit('typing', this.props.liveChat.room);
        this.props.dispatch(chatActions.chatOnChange(e.target.value));
    }

    render() {
        return (
            <LiveChat
                onSubmit={this.onSubmit.bind(this)}
                onChange={this.onChange.bind(this)}
                newUser={this.newUser.bind(this)}
                chatOpen={this.props.liveChat.chatOpen}
                dispatch={this.props.dispatch}
                {...this.props.liveChat}
            />
        );
    }
}

function mapStateToProps(state) {
    return {
        liveChat: state.liveChat,
    };
}
function mapDispatchToProps(dispatch) {
    return {
        dispatch: dispatch,
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LiveChatContainer);
