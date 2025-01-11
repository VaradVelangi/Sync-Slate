import SplitterComponent from "@/components/SplitterComponent"
import ConnectionStatusPage from "@/components/connection/ConnectionStatusPage"
import Sidebar from "@/components/sidebar/Sidebar"
import WorkSpace from "@/components/workspace"
import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import useUserActivity from "@/hooks/useUserActivity"
import { SocketEvent } from "@/types/socket"
import { USER_STATUS, User } from "@/types/user"
import { useEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { AlertTriangle } from "lucide-react"




interface LocationState {
    username?: string
    roomId?: string
}

function EditorPage() {
    useUserActivity()
    const navigate = useNavigate()
    const { roomId } = useParams<{ roomId: string }>()
    const { status, setCurrentUser, currentUser } = useAppContext()
    const { socket } = useSocket()
    const location = useLocation()
    const locationState = location.state as LocationState
    const [isRemoved] = useState<boolean>(false)
    

   

    


    useEffect(() => {
        if (currentUser.username.length > 0) return
        const username = locationState?.username
        if (username === undefined) {
            navigate("/", {
                state: { roomId },
            })
        } else if (roomId) {
            const user: User = { username, roomId }
            setCurrentUser(user)
            socket.emit(SocketEvent.JOIN_REQUEST, user)
        }
    }, [
        currentUser.username,
        locationState?.username,
        navigate,
        roomId,
        setCurrentUser,
        socket,
    ])

    if (status === USER_STATUS.CONNECTION_FAILED) {
        return <ConnectionStatusPage />
    }

    if (isRemoved) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-red-50 p-4">
                <div className="text-center">
                    <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-red-500" />
                    <h1 className="mb-2 text-2xl font-bold text-red-700">
                        Access Denied
                    </h1>
                    <p className="text-red-600">
                        You have been removed from the room due to multiple fullscreen violations.
                    </p>
                </div>
            </div>
        );
    }
    
    return (
        <>
            <SplitterComponent>
                <Sidebar />
                <WorkSpace />
            </SplitterComponent>
        </>
    );
    
    
}

export default EditorPage
