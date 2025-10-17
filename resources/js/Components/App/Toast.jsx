import { useEventBus } from "@/EventBus";
import { useEffect, useState } from "react";
import {v4 as uuidv4 } from "uuid";

export default function Toast({}) {
    const {on}= useEventBus();

    const [toasts,setToasts]=useState([]);

    useEffect(()=>{
        on('toast.show',(message) => {
            const uuid = uuidv4();
            setToasts((oldToasts) => [...oldToasts, {  message ,uuid }]);
            setTimeout(() => {
                setToasts((oldToasts) => oldToasts.filter((toast) => toast.uuid !== uuid));
            }, 3000);

        })

    },[on]);

    return (
        <div className="toast min-w-[250px]">
           {toasts.map((toast)=>(
             <div key={toast.uuid} className="alert alert-success py-3 px-4 text-gray-100 rounded-md shadow-lg">
                <span>{toast.message}</span>
            </div>
            ))}
        </div>
    );
}
