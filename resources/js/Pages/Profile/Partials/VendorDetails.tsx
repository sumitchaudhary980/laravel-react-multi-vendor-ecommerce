import React, {
  FormEventHandler,
  useState,
} from 'react';

import InputError from '@/Components/Core/InputError';
import InputLabel from '@/Components/Core/InputLabel';
import Modal from '@/Components/Core/Modal';
import PrimaryButton from '@/Components/Core/PrimaryButton';
import SecondaryButton from '@/Components/Core/SecondaryButton';
import TextInput from '@/Components/Core/TextInput';
import {
  useForm,
  usePage,
} from '@inertiajs/react';

export default function VendorDetails({
      className = "",
  }: {
      className?: string;
  }) {
      const [showBecomeVendorConfirmation, setShowBecomeVendorConfirmation] =
          useState(false);
      const [successMessage, setSuccessMessage] = useState("");
      const user = usePage().props.auth.user;
      const token = usePage().props.csrf_token;

      const { data, setData, errors, post, processing, recentlySuccessful } =
          useForm({
              store_name: user.vendor?.store_name || user.name.toLowerCase().replace(/\s+/g, '-'),
              store_address: user.vendor?.store_address,
          });

      const onStoreNameChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
          setData(
              "store_name",
              ev.target.value
          );
      };

      const becomeVendor: FormEventHandler = (ev) => {
          ev.preventDefault();

          post(route("vendor.store"), {
              preserveScroll: true,
              onSuccess: () => {
                  closeModal();
                  setSuccessMessage("We will notify you once when you get approved..");
              },
              onError: (errors) => {},
          });
      };

      const updateVendor: FormEventHandler = (ev) => {
          ev.preventDefault();

          post(route("vendor.store"), {
              preserveScroll: true,
              onSuccess: () => {
                  closeModal();
                  setSuccessMessage("Your details were updated.");
              },
              onError: (errors) => {},
          });
      };

      const dismissSuccessMessage = () => {
          setSuccessMessage(""); // Clear the success message
      };

      const closeModal = () => {
          setShowBecomeVendorConfirmation(false);
      };

      return (
          <section className={className}>
              {recentlySuccessful && successMessage && (
                  <div className="toast toast-top toast-end z-[1000] mt-16">
                      <div className="alert alert-success">
                          <span>{successMessage}</span>
                          <button
                              className="ml-4 text-xl"
                              onClick={dismissSuccessMessage}
                          >
                              &times;
                          </button>
                      </div>
                  </div>
              )}

              <header>
                  <h2 className="flex justify-between mb-8 text-lg font-medium text-gray-900 dark:text-gray-100">
                      Vendor Details
                      {user.vendor?.status === "pending" && (
                          <span className={"badge badge-warning"}>
                              {user.vendor.status_label}
                          </span>
                      )}
                      {user.vendor?.status === "rejected" && (
                          <span className={"badge badge-error"}>
                              {user.vendor.status_label}
                          </span>
                      )}
                      {user.vendor?.status === "approved" && (
                          <span className={"badge badge-success"}>
                              {user.vendor.status_label}
                          </span>
                      )}
                  </h2>
              </header>

              <div>
                  {!user.vendor && (
                      <PrimaryButton
                          onClick={(ev) => setShowBecomeVendorConfirmation(true)}
                          disabled={processing}
                      >
                          Become a Vendor
                      </PrimaryButton>
                  )}

                  {user.vendor && (
                      <>
                          <form onSubmit={updateVendor}>
                              <div className="mb-4">
                                  <InputLabel htmlFor="name" value="Store Name" />

                                  <TextInput
                                      id="name"
                                      className="mt-1 block w-full"
                                      value={data.store_name}
                                      onChange={onStoreNameChange}
                                      required
                                      isFocused
                                      autoComplete="name"
                                  />

                                  <InputError
                                      className="mt-2"
                                      message={errors.store_name}
                                  />
                              </div>

                              <div className="mb-4">
                                  <InputLabel
                                      htmlFor="store_address"
                                      value="Store Address"
                                  />
                                  <textarea
                                      id="store_address"
                                      className="textarea textarea-bordered w-full mt-1"
                                      value={data.store_address}
                                      onChange={(e) =>
                                          setData("store_address", e.target.value)
                                      }
                                      placeholder="Enter Your Store Address"
                                  ></textarea>

                                  <InputError
                                      className="mt-2"
                                      message={errors.store_address}
                                  />
                              </div>
                              <div className="flex items-center gap-4">
                                  <PrimaryButton disabled={processing}>
                                      Update
                                  </PrimaryButton>
                              </div>
                          </form>
                          <form
                              action={route("stripe.connect")}
                              method={"post"}
                              className={"my-8"}
                          >
                              <input type="hidden" name="_token" value={token} />
                              {user.stripe_account_active && (
                                  <div
                                      className={
                                          "text-center text-gray-600 my-4 text-sm"
                                      }
                                  >
                                      You are successfully connected to Stripe
                                  </div>
                              )}
                              <button className="btn btn-primary w-full"
                              disabled={user.stripe_account_active || user.vendor.status==='pending'}>
                                  Connect to Stripe
                              </button>
                          </form>
                      </>
                  )}
              </div>

              <Modal show={showBecomeVendorConfirmation} onClose={closeModal}>
                  <form onSubmit={becomeVendor} className="p-8 bg-white dark:bg-gray-800">
                      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          Are you sure you want to become a Vendor?
                      </h2>

                      <div className="mt-6 flex justify-end">
                          <SecondaryButton onClick={closeModal}>
                              Cancel
                          </SecondaryButton>
                          <PrimaryButton className="ms-3" disabled={processing}>
                              Confirm
                          </PrimaryButton>
                      </div>
                  </form>
              </Modal>
          </section>
      );
  }
