import React, { Component } from 'react';
import PropTypes from 'prop-types';

class PreReg extends Component {
    componentDidUpdate() {
        // if (this.props.chatOpen) {
        //     this.refs.nameInput.focus();
        // }
    }

    render() {
        const chatOnline = this.props.remoteId ? (
            <div>
                <p>Say hello. Please enter your name to begin.</p>
                <p className="disclaimer">
                    <i>
                        Disclaimer: I may or may not be able to respond right
                        away, but if I can't I will receive your message and get
                        back to you soon.
                    </i>
                </p>
            </div>
        ) : (
            <p>
                I'm not available right now, but feel free to leave your name,
                email and message and I'll get back to you shortly.
            </p>
        );

        const chatOffline = !this.props.remoteId ? (
            <div className="registration-message form-group">
                <textarea
                    className="form-control"
                    name="message"
                    placeholder="Message"
                />
            </div>
        ) : (
            ''
        );

        return (
            <div>
                {chatOnline}
                <form
                    className="live-chat-registration"
                    onSubmit={this.props.newUser}
                >
                    <div
                        ref="registrationName"
                        className="registration-name form-group"
                    >
                        <input
                            ref="nameInput"
                            type="text"
                            className="form-control"
                            name="name"
                            placeholder="Your name"
                        />
                    </div>

                    <div className="registration-email form-group">
                        <input
                            type="text"
                            className="form-control"
                            name="email"
                            placeholder="Email"
                        />
                    </div>

                    {chatOffline}

                    <button
                        type="submit"
                        className="registration-button button button-smaller button-block"
                    >
                        Send
                    </button>
                </form>
            </div>
        );
    }
}

PreReg.propTypes = {};
PreReg.defaultProps = {};

export default PreReg;
