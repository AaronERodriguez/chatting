"use client"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel'
import React, { Dispatch, SetStateAction, useState } from 'react'
import { toast } from 'sonner';
import {UploadDropzone, UploadFileResponse} from "@xixixao/uploadstuff/react"
import { useMutation, useQuery } from 'convex/react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useMutationState } from '@/hooks/useMutationState';
import { ConvexError } from 'convex/values';

type Props = {
    conversationId: Id<"conversations">;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>
}

const UploadImageDialog = ({conversationId, open, setOpen}: Props) => {
    const generateUploadUrl = useMutation(api.message.generateUploadUrl);
    const saveStorageId = useMutation(api.message.saveStorageIds);
    const {mutate: createMessage, pending} = useMutationState(api.message.create)

    const [selected, setSelected] = useState<string[] | null>([]);

    const images = useQuery(api.images.get);

    const toggleSelection = (storageId: string) => {
        if (selected?.includes(storageId)) {
            setSelected((prev) => {
                return prev!.filter(id => id !== storageId)
            })
        } else {
            setSelected((prev) => {
                return [...prev!, storageId]
            })
        }
    }
    
    const saveAfterUpload = async (uploaded: UploadFileResponse[]) => {
        await saveStorageId({
          storageIds: uploaded.map(({ response }) => ({
            storageId: (response as any).storageId,
          })),
        });
        setSelected([]);
      };

      const handleSendImage = async () => {
        createMessage({
            conversationId,
            type: "images",
            content: [...selected!]
        }).then(() => {
            setOpen(false);
        }).catch((error) => {
            toast.error(error instanceof ConvexError ? error.data : "Unexpected error occurred")
        })
      }

    return (
    <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>
                    Upload your image here
                </AlertDialogTitle>
                <AlertDialogDescription className='flex flex-col justify-center items-center'>
                <UploadDropzone
                uploadUrl={generateUploadUrl}
                fileTypes={{
                    "image/*": [".png", ".gif", ".jpeg", ".jpg"],
                }}
                multiple
                onUploadComplete={saveAfterUpload}
                onUploadError={(error: unknown) => {
                    // Do something with the error.
                    alert(`ERROR! ${error}`);
                }}
                />
                {images && images.length > 0 ? <div className='w-full flex flex-row flex-wrap'>
                    <Carousel className='w-full max-w-xs h-52 block mx-auto'>
                        <CarouselContent>        
                            {images.map(image => {
                                return <CarouselItem key={image.id}>
                                    <img src={image.url!} className={`h-52 ${selected?.includes(image.url!) ? "border rounded-lg border-primary" : ""}`} onClick={() => toggleSelection(image.url!)}/>
                                </CarouselItem> 
                            })}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                </div> : null}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>
                    Cancel
                </AlertDialogCancel>
                <AlertDialogAction disabled={selected?.length === 0 || pending} onClick={handleSendImage}>
                    Send
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  )
}

export default UploadImageDialog