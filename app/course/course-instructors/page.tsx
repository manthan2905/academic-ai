'use client'


import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { FormEvent, useState, useEffect } from "react"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const page = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [saved, setSaved] = useState<string[]>();

    useEffect(() => {
        fetch("/api/saved-documents")
            .then((res) => res.json())
            .then((data) => {
                setSaved(data);
            });
    }, []);

    const [file, setFile] = useState<File | null>();
    const ingest = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!file) {
            return;
        }
        try {
            setIsLoading(true);
            const data = new FormData();
            data.set("file", file, file.name);

            const response = await fetch("/api/retrieval/ingest", {
                method: "POST",
                body: data
            });

            if (response.status === 200) {
                toast("Uploaded!");
                console.log('test')
                setSaved((prevSaved) => [...(prevSaved || []), file?.name]);
            } else {
                const json = await response.json();
                if (json.error) {
                    toast(json.error);
                }
            }
            setIsLoading(false);
        } catch (error) {
            console.error(error);
            toast("Error uploading file");
            setIsLoading(false);
        }
    }

    return (
        <>
            <Card className="w-[486px]">
                <CardHeader>
                    <CardTitle>Course Materials and Assignments</CardTitle>
                    <CardDescription>The AI model will use these materials will be used for reference.</CardDescription>
                </CardHeader>
                <form onSubmit={ingest} className="flex flex-col w-full mb-4">

                    <CardContent className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5 ">
                            <Label htmlFor="file">PDF Upload</Label>
                            <Input id="file" type="file" onChange={(e) => setFile(e.target.files?.[0])} />
                        </div>

                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="typeofsub">Type of Submission</Label>
                            <Select>
                                <SelectTrigger id="typeofsub">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    <SelectItem value="syllabus">Syllabus</SelectItem>
                                    <SelectItem value="course-details">Course-details</SelectItem>
                                    <SelectItem value="course-content">Course-content</SelectItem>
                                    <SelectItem value="assignment">Assignment</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Button variant="secondary" type="submit" className="shrink-0">
                            <div role="status" className={`${isLoading ? "pr-3" : "hidden"} flex justify-center`}>
                                <svg aria-hidden="true" className="w-6 h-6 text-white animate-spin dark:text-white fill-sky-800" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                </svg>
                            </div>

                            {isLoading ? "Loading..." : "Upload"}</Button>
                    </CardFooter>
                </form>
            </Card>

            <Card className="w-[486px] my-5 min-h-[200px]">
            <CardHeader>
                    <CardDescription>List of PDF Files uploaded currently in use:</CardDescription>
                </CardHeader>
                <CardContent>
                <ul>
                    {saved?.length != 0 ? saved?.map((name: string, index: number) => (
                        <li key={index}>{name}</li>
                    )) : "None"}
                </ul>
                </CardContent>                

            </Card>
            <ToastContainer />
        </>
    )
}



export default page;