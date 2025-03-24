import React, {
  useRef,
  useState,
} from 'react';

import Swal from 'sweetalert2';

import InputLabel from '@/Components/Core/InputLabel';
import TextInput from '@/Components/Core/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

const Contact = () => {
    const [result, setResult] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const formRef = useRef<HTMLFormElement>(null);

    const validateForm = (formData: FormData) => {
        let errors: { [key: string]: string } = {};
        // Name Validation
        const name = formData.get('name') as string;
        if (!/^[A-Za-z]+$/.test(name)) {
            errors.name = "Name must contain only alphabets";
        }

        // Email Validation
        const email = formData.get('email') as string;
       if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = "Please enter a valid email address.";
        }

        // Phone Validation
        const phone = formData.get('number') as string;
        if (!/^\+(\d{1,4})[\s-]?(\d{1,4})[\s-]?\d{1,4}[\s-]?\d{1,4}$/.test(phone)) {
            errors.number = "Please enter a valid phone number with country code (e.g., +9779704181697 or +1 123 456 7890).";
        }

        // Message Validation
        if (!formData.get('message')) {
            errors.message = "Message is required.";
        }

        return errors;
    };

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const formErrors = validateForm(formData);

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors); // Set errors if there are validation issues
            return;
        }

        setErrors({}); // Clear errors if validation is successful

        formData.append("access_key", "1457a69c-7c9e-482a-bb5f-225de9a19c2c");

        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        try {
            const res = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: json,
            });

            const data = await res.json();

            if (data.success) {
                Swal.fire({
                    title: "Success",
                    text: "Message sent successfully! Our team will reach you shortly.",
                    icon: "success",
                });

                if (formRef.current) {
                    formRef.current.reset(); // Clear the form after successful submission
                }
            } else {
                Swal.fire({
                    title: "Failed",
                    text: "Submission failed! Please try again later.",
                    icon: "error",
                });
            }
        } catch (error) {
            console.error("Fetch error:", error);
            setResult("Error submitting the form.");
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Contact" />
            <div>
                <div className="md:w-96 mx-auto text-center my-24">
                    <div className="text-2xl font-bold">Get in Touch</div>
                    <div className="text-xl">
                        Have any questions or need assistance? We’re here to
                        help! Reach out to us, and we’ll get back to you as soon
                        as possible.
                    </div>
                </div>
                <div className="container mx-auto flex flex-wrap shadow-2xl my-20 rounded-md p-5">
                    <div className="lg:w-1/2 w-full p-4">
                        <form
                            ref={formRef}
                            className="shadow-md rounded-lg px-2 pt-6 pb-8 mb-4"
                            onSubmit={onSubmit}
                        >
                            <div className="flex flex-col">
                                <InputLabel htmlFor="name" value="Name" />
                                <TextInput
                                    id="name"
                                    name="name"
                                    required
                                    placeholder="Enter your name"
                                    className="mt-1 block w-full"
                                />
                                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

                                <InputLabel htmlFor="email" value="Email" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="Enter your email"
                                    className="mt-1 block w-full"
                                />
                                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

                                <InputLabel htmlFor="number" value="Phone Number" />
                                <TextInput
                                    id="number"
                                    name="number"
                                    required
                                    placeholder="Enter your Phone Number"
                                    className="mt-1 block w-full"
                                />
                                {errors.number && <p className="text-red-500 text-sm">{errors.number}</p>}

                                <InputLabel htmlFor="message" value="Message" />
                                <textarea
                                    name="message"
                                    required
                                    placeholder="Enter your Message"
                                    className="input input-bordered mt-1 block w-full h-48"
                                ></textarea>
                                {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}

                                <button className="btn rounded-full w-full my-4">
                                    Send Message
                                </button>
                            </div>
                        </form>
                        {result && <p className="text-center mt-4">{result}</p>}
                    </div>
                    <div className="lg:w-1/2 w-full p-4">
                        <div className="relative aspect-w-16 h-[50vw] lg:h-full aspect-h-9">
                            <iframe
                                className="absolute inset-0 w-full h-full"
                                src="https://maps.google.com/maps?width=100%25&height=600&hl=en&q=1%20Grafton%20Street,%20Dublin,%20Ireland+(Buyzon)&t=&z=14&ie=UTF8&iwloc=B&output=embed"
                                allowFullScreen
                                loading="lazy"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Contact;
