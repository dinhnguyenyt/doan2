import classNames from 'classnames/bind';
import styles from './ChatBot.module.scss';

import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const cx = classNames.bind(styles);

function ChatBot() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [checkChatBot, setCheckChatBot] = useState(false);
    const socketRef = useRef(null);

    useEffect(() => {
        if (checkChatBot) {
            socketRef.current = io('http://localhost:5000', {
                withCredentials: true,
            });

            socketRef.current.on('message', (msg) => {
                setMessages((prev) => [...prev, msg]);
            });

            return () => {
                socketRef.current.disconnect();
                socketRef.current = null;
            };
        }
    }, [checkChatBot]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (message.trim() !== '' && socketRef.current) {
            socketRef.current.emit('sendMessage', message);
            setMessage('');
        }
    };

    return (
        <>
            {checkChatBot ? (
                <>
                    <div className={cx('wrapper')}>
                        <header className={cx('header')}>
                            <img
                                src="https://img.freepik.com/free-vector/chatbot-chat-message-vectorart_78370-4104.jpg?size=338&ext=jpg&ga=GA1.1.1141335507.1719014400&semt=sph"
                                alt=""
                            />
                            <h2>Chăm Sóc Khách Hàng</h2>
                            <button onClick={() => setCheckChatBot(false)}>
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </header>

                        <main className={cx('main')}>
                            {messages.map((message, index) => (
                                <div className={cx('message')} key={index}>
                                    {index % 2 === 0 ? (
                                        <div className={cx('user-message')}>{message}</div>
                                    ) : (
                                        <div className={cx('bot-message')}>{message}</div>
                                    )}
                                </div>
                            ))}
                        </main>

                        <footer className={cx('footer')}>
                            <input
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        sendMessage(e);
                                    }
                                }}
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Gửi Tin Nhắn...."
                            />
                        </footer>
                    </div>
                </>
            ) : (
                <>
                    <div className={cx('show-chatbox')}>
                        <button onClick={() => setCheckChatBot(true)}>
                            <img
                                src="https://img.freepik.com/free-vector/chatbot-chat-message-vectorart_78370-4104.jpg?size=338&ext=jpg&ga=GA1.1.1141335507.1719014400&semt=sph"
                                alt=""
                            />
                        </button>
                    </div>
                </>
            )}
        </>
    );
}

export default ChatBot;
