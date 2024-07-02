"use client";
import Link from "next/link";

const Header = () => {
    return (
        <nav className="navbar flex justify-between p-8">
            <div>Logo Terrabond</div>
            <Link href="/">Home</Link>
        </nav>
    );
};

export default Header;
