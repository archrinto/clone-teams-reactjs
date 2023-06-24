const ChatActiveEmpty = () => {
    return (
        <div className="flex flex-col h-full absolute left-0 right-0 top-0 bottom-0 justify-center items-center">
            <div className="text-center">
                <h3 className="text-gray-700 text-lg">
                    Start new conversation
                </h3>
                <p className="text-gray-400">
                    Select a user or create a group chat to start a conversation
                </p>
            </div>
        </div>
    )
}
export default ChatActiveEmpty;