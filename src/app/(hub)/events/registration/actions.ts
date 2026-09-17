"use server";
import {revalidatePath} from "next/cache";import {getCurrentUser} from "@/lib/auth";import {createServerClient} from "@/lib/supabase/server";
export async function registerForApprovedEvent(fd:FormData){const user=await getCurrentUser();if(!user)return;const db=await createServerClient();await db.rpc("register_for_event",{p_approval_id:String(fd.get("approval_id")??"")});revalidatePath("/events/registration");}
export async function cancelEventRegistration(fd:FormData){const user=await getCurrentUser();if(!user)return;const db=await createServerClient();await db.rpc("cancel_event_registration",{p_registration_id:String(fd.get("registration_id")??"")});revalidatePath("/events/registration");}
