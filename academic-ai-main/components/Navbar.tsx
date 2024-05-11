"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "./ui/button";

import Link from "next/link";

export function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="m-4 flex flex-row">
      <Image
        src="/images/logo-no-words.png"
        width="75"
        height="75"
        alt={""}
        className="mr-4"
      />
      <h1 className="ms-5 text-4xl py-4">Academic AI</h1>
      <div className="flex flex-row justify-end flex-grow ">
        {/*
        <a
          className={`my-auto mr-4 ${
            pathname === "/retrieval" ? "text-white border-b" : ""
          }`}
          href="/retrieval"
        >
          Chat with Virtual Assistant
        </a>
        <a
          className={`my-auto mr-4 ${
            pathname === "/course-instructors" ? "text-white border-b" : ""
          }`}
          href="/course-instructors"
        >
          Course Instructor
        </a>
        */}
        {/*
      <a className={`mr-4 ${pathname === "/structured_output" ? "text-white border-b" : ""}`} href="/structured_output">🧱 Structured Output</a>
      <a className={`mr-4 ${pathname === "/agents" ? "text-white border-b" : ""}`} href="/agents">🦜 Agents</a>
      <a className={`mr-4 ${pathname === "/retrieval_agents" ? "text-white border-b" : ""}`} href="/retrieval_agents">🤖 Retrieval Agents</a>
    */}
    <Link href='/' className="my-auto">
    <Button variant="secondary" >
      All Courses
      </Button>

      </Link>
      </div>
    </nav>
  );
}
