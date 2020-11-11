import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyA6VU_OoxoX5Ubx7Pc19cb759G4PLiYsH0",
  authDomain: "messageapp-0.firebaseapp.com",
  databaseURL: "https://messageapp-0.firebaseio.com",
  projectId: "messageapp-0",
  storageBucket: "messageapp-0.appspot.com",
  messagingSenderId: "632541097735",
  appId: "1:632541097735:web:3de63953b8c49dbd4adfa2"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1> Chat</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p className="terms">Do not violate the community guidelines or you will be banned for life!</p>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {

  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);
 
  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    console.log('Event fired');
    e.preventDefault();

    const { uid, photoURL, displayName } = auth.currentUser;
    console.log('Defined parameters for currentUser');
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      displayName,
      uid,
      photoURL

    })
    console.log('MessageRef added');

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }
  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>
    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Message" />

      <button type="submit" disabled={!formValue}>🕊️</button>

    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL, displayName } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://avatars.dicebear.com/api/gridy/mnojttttubhg.svg'} />
      <p>{text}</p>
    </div>
    <div className={`message ${messageClass}`} id="name">
      <b>{displayName}</b>
    </div>
  </>)
}


export default App;