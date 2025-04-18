// src/components/Notification.js
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const notify = (message) => {
  toast(message, { autoClose: 5000 });
};

const Notification = () => (
  <div>
    <ToastContainer />
  </div>
);

export default Notification;
