"use client";

const Footer = () => {
    return (
        <div>
            <footer className="text-center w-full p-10">
                Tous droits réservés &copy; {new Date().getFullYear()}
            </footer>
        </div>
    );
};

export default Footer;
