import React, { useContext, useState } from 'react';
import { MessengerContext } from './MessengerContext'; 
import DefaultImage from '../assets/default-image.png';
import ItemList from "./ItemList.jsx";
import CreateRoomForm from "./CreateRoomForm.jsx";
import Modal from "./Modal.jsx"; 
import RightArrow from "../assets/right-arrow.png";
import LeftArrow from "../assets/left-arrow.png";

function NavPanel() {
    const { user } = useContext(MessengerContext); 

    const [selectedTab, setSelectedTab] = useState("Rooms");
    const [online, setOnline] = useState(true);
    const [hidden, setHidden] = useState(true);
    const [showRoomModal, setShowRoomModal] = useState(false);

    return (
        <div>
            <img 
                src={ hidden ? RightArrow : LeftArrow } 
                alt="An arrow button to open and close the navigation panel" 
                onClick={() => setHidden(!hidden)}
            />
            <div style={{display: hidden ? "none" : "block" }}>
                <div>
                    <img src={DefaultImage} alt="Image of the user's avatar" />
                    <h3><strong>{user.username}</strong></h3>
                </div>
                <div>
                    <h3 onClick={() => setSelectedTab("Rooms")}>Rooms</h3>
                    <h3 onClick={() => setSelectedTab("Users")}>Users</h3>
                </div>
                {selectedTab === "Rooms" ? (
                    <h2 onClick={() => setShowRoomModal(true)}>Create New Room</h2>
                ) : (
                    <h2 onClick={() => setOnline(!online)}>
                        {online ? "Disable Presence" : "Enable Presence"}
                    </h2>
                )}

                {
                    selectedTab === "Rooms" ? 
                    <ItemList type={"rooms"} /> :
                    <ItemList type={"users"} />
                }

                {showRoomModal && (
                    <Modal onClose={() => setShowRoomModal(false)}>
                        <CreateRoomForm onClose={() => setShowRoomModal(false)} />
                    </Modal>
                )}
            </div>
        </div>
    );
}

export default NavPanel;