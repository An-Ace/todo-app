import { getData } from "@/actions/todoActions";
import { getAllUser, getUser } from "@/actions/userActions";
import Todo from "@/components/Todo";
import Todos from "@/components/Todos";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect } from "next/navigation";

export  default async  function  Home() {
  const users =  await getAllUser();
  const auth = await currentUser()
  if (!auth) redirect('/sign-in')
  const user = await getUser(auth?.id)
  // if (!user) redirect('/sign-in')
  const data = await getData(user?.id!);

  // console.log(user)
  return (
    <main className="flex   items-center justify-between">
      {/* <div>123</div> */}
     <Todos todos={data} user={users[0]}/>
    </main>
  );

}