import {
  PropsWithChildren,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Footer } from '@/Components/App/Footer';
import { Navbar } from '@/Components/App/Navbar';
import { usePage } from '@inertiajs/react';

export default function AuthenticatedLayout({
    header,
    children,
  }: PropsWithChildren<{ header?: ReactNode }>) {
    const props = usePage().props;
    const user = props.auth.user;

    const [successMessage, setSuccessMessage] = useState<any>(null); // Keep only the latest message

    const timeoutRefs = useRef<{ [key: number]: ReturnType<typeof setTimeout> }>({});

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    // Function to dismiss a message manually
    const dismissMessage = (id: number) => {
      setSuccessMessage(null); // Dismiss the message manually
      // Clear the timeout for the dismissed message
      if (timeoutRefs.current[id]) {
        clearTimeout(timeoutRefs.current[id]);
        delete timeoutRefs.current[id];
      }
    };

    useEffect(() => {
      if (props.success.message) {
        const newMessage = {
          ...props.success,
          id: props.success.time, // Use time as unique identifier
        };

        // Set the new success message
        setSuccessMessage(newMessage);

        // Set a timeout to automatically dismiss the message after 5 seconds
        const timeoutId = setTimeout(() => {
          setSuccessMessage(null); // Clear the message after timeout
          delete timeoutRefs.current[newMessage.id];
        }, 5000);

        timeoutRefs.current[newMessage.id] = timeoutId;
      }
    }, [props.success]);

    return (
      <div className="min-h-screen">
        <Navbar />

        {props.error && (
          <div className="container mx-auto px-8 mt-8">
            <div className="alert alert-error">{props.error}</div>
          </div>
        )}

        {/* Display success message if available */}
        {successMessage && (
          <div className="toast toast-top toast-end z-[1000] mt-16">
            <div className="alert alert-success" key={successMessage.id}>
              <span>{successMessage.message}</span>
              <button
                className="ml-4 text-xl"
                onClick={() => dismissMessage(successMessage.id)}
              >
                &times;
              </button>
            </div>
          </div>
        )}

        <main>{children}</main>
        <Footer/>
      </div>
    );
  }
