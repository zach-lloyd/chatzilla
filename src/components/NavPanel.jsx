import React, { useContext, useState } from 'react';
import { MessengerContext } from './MessengerContext'; 
import DefaultImage from '../assets/default-image.png';
import ItemList from "./ItemList.jsx";
import CreateRoomForm from "./CreateRoomForm.jsx";
import Modal from "./Modal.jsx"; 
import RightArrow from "../assets/right-arrow-green.png";
import LeftArrow from "../assets/left-arrow-green.png";
import Offcanvas from 'react-bootstrap/Offcanvas';

function NavPanel() {
    const { user, togglePresence } = useContext(MessengerContext); 

    const [selectedTab, setSelectedTab] = useState("Rooms");
    const [hidden, setHidden] = useState(true);
    const [showRoomModal, setShowRoomModal] = useState(false);

    return (
        <div style={{backgroundColor: hidden ? "#1f0131" : "#402468" }}>
            <img 
                src={ hidden ? RightArrow : LeftArrow } 
                alt="An arrow button to open and close the navigation panel" 
                onClick={() => setHidden(!hidden)}
                style={{
                    position: 'fixed',
                    zIndex: 1050,
                    cursor: 'pointer',
                    width: '50px'
                }}
            />
            
            <Offcanvas
                show={hidden}
                onHide={() => setHidden(!hidden)}
                placement="start"     /* slide in from the left */
                backdrop={false}      /* keep underlying page clickable */
                scroll                /* body scroll stays enabled */
            >
                <Offcanvas.Header className="pb-0 mt-5">
                    <Offcanvas.Title className="d-flex justify-content-center">
                        <img 
                            src={DefaultImage} 
                            alt="Image of the user's avatar"
                            width="100px"
                            className="rounded-circle me-2" 
                        />
                        <h3 className="text-center align-self-center"><strong>{user.username}</strong></h3>
                    </Offcanvas.Title>
                </Offcanvas.Header>

                <Offcanvas.Body className="px-4">
                    <div className="container">
                        <div className="row">
                            <div className="col-6">
                                <h3 onClick={() => setSelectedTab("Rooms")}>Rooms</h3>
                            </div>
                            <div className="col-6">
                                <h3 onClick={() => setSelectedTab("Users")}>Users</h3>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12">
                                {selectedTab === "Rooms" ? (
                                    <>
                                        <h5 
                                            onClick={() => setShowRoomModal(true)}
                                            className="place-self-center"
                                            style={{
                                                cursor: 'pointer',
                                                backgroundColor: "#402468"
                                            }}
                                        >
                                            Create New Room
                                        </h5>
                                        <ItemList type={"rooms"} />
                                    </>
                                    
                                ) : (
                                    <>
                                        <h5 onClick={ togglePresence }>
                                            { user.presence ? "Disable Presence" : "Enable Presence" }
                                        </h5>
                                        <ItemList type={"users"} />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {showRoomModal && (
                        <Modal onClose={() => setShowRoomModal(false)}>
                            <CreateRoomForm onClose={() => setShowRoomModal(false)} />
                        </Modal>
                    )}
                </Offcanvas.Body>
            </Offcanvas>
        </div>
    );
}

export default NavPanel;
