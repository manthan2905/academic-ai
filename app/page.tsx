import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import course_image from "/public/images/course_photo.avif";
import suresh_kumar from "/public/images/suresh-kumar.jpeg";

export default function Home() {
  return (
    <div className="p-12">
      <div className="pb-8">
        <h1 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Available Courses:{" "}
        </h1>
      </div>
      <div>
        <Card className="w-[350px]">
          <Image src={course_image} alt="course" className="rounded-sm" />
          <div className="absolute -mt-8 bg-[#424242] w-[225px] h-12">
            <p className="absolute px-14 py-3 text-lg">Prof. Kumar</p>
            <Image
              className="ms-2 mt-1 rounded-full"
              src={suresh_kumar}
              alt="suresh-kumar"
              height="40"
            />
          </div>
          <CardContent></CardContent>
          <CardFooter className="flex justify-between">
            <CardTitle>CS485 - Intro to Technology Startup</CardTitle>
            <Link href="/course">
              <Button variant="secondary">Start</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
