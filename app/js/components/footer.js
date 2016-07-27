import React, {Component} from 'react';
import ContactForm from './contactForm'
import * as contactActions  from '../actions/contact';

export default class Footer extends React.Component {

    render() {
        const renderContactForm = this.props.contactForm.readyState === 'SUBMIT_CONTACT_SUCCESS' ?
            <p className="thanks">Thanks for your email!</p> :
            <ContactForm {...this.props} />;

        return (
            <footer className="footer">
                <div className="border"></div>
                <div className="container-fluid">
                    <div className="row" className="contact" id="contact">
                        <div className="col-lg-4">
                            <h4>CONTACT</h4>
                            <p className="contact-method"><i className="fa fa-phone"></i> (415) 287-3221</p>
                            <p className="contact-method"><i className="fa fa-envelope"></i> <a href="mailto:customerservice@jasongallagher.org?Subject=Interested%20in%20your%20services" target="_top">Email me</a></p>
                            <p className="contact-method skype"><i className="fa fa-skype"></i> <a href="skype:jason-gallagher?chat">Skype me</a></p>
                            <h4 className="about-this-site">ABOUT THE SITE</h4>
                            <p className="about-this-site-text">This site is 100% <span>HANDCRAFTED</span> with React, Redux, Node, Mysql, and <span>OF COURSE</span>, Html and CSS. It is <span>UNIVERSAL</span>, or rather a single page app that is first rendered on the server. Not to be mistaken for yet another <span>HIPSTER BUZZWORD</span>, this is really great for performance, accessibility and SEO!</p>
                        </div>
                        {renderContactForm}
                    </div>
                </div>
            </footer>
        );
    }
}