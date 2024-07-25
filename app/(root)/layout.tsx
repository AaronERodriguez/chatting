"use client"

import SidebarWrapper from '@/components/shared/sidebar/SidebarWrapper'
import { api } from '@/convex/_generated/api'
import { useQuery } from 'convex/react'
import React, { useEffect, useState } from 'react'
import sendNotification from '../_helper/sendNotification'
import { useMutationState } from '@/hooks/useMutationState'
import { useConversation } from '@/hooks/useConversation'

type Props = React.PropsWithChildren<{}>

const Layout = ({children}: Props) => {

  const {mutate: setNotified} = useMutationState(api.notification.setNotified)

  const conversations = useQuery(api.conversations.get)

  const {conversationId} = useConversation();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js")
      .then((registration) => {
        console.log("Registration successful");
      })
      .catch(error => {
        console.log("Registration failed");
      })
    }

    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        } else {
          console.log('Notification permission denied.');
        }
      })
    }
  }, [])

  useEffect(() => {
      conversations?.map(conversation => {
        if (conversation.lastMessage && conversation.unseenCount > 0 && conversation.notification === false && conversationId !== conversation.conversation._id) {
          setNotified({conversationId: conversation.conversation._id})
          sendNotification(conversation.conversation.isGroup ? conversation.conversation.name! : conversation.otherMember!.username, {body: `${conversation.lastMessage.sender}: ${conversation.lastMessage.content}`, icon: conversation.conversation.isGroup ? undefined : conversation.otherMember?.imageUrl})
        }
      })
  }, [conversations])

  return (
    <SidebarWrapper>{children}</SidebarWrapper>
  )
}

export default Layout