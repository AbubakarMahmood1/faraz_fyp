"use client";
import Image from "next/image";
import Logo from "@/assets/Images/logo.png";
import { useSelector } from "react-redux";
import { Button } from "rizzui";
import Link from "next/link";
export default function MainHeader() {
  const user = useSelector((state) => state.user.username);
  return (
    <div className="max-w-full border-b">
      <div className="max-w-6xl mx-auto md:max-w-[1400px] flex justify-between items-center">
        <Link href="/">
          <Image src={Logo} alt="innovate logo" />
        </Link>
        <div>
          {!user ? (
            <Link href="/signin">
              <Button>Join us</Button>
            </Link>
          ) : (
            <h1>user account settinhs</h1>
          )}
        </div>
      </div>
    </div>
  );
}
