import {
  FormEventHandler,
  useEffect,
  useRef,
  useState,
} from 'react';

import InputError from '@/Components/Core/InputError';
import InputLabel from '@/Components/Core/InputLabel';
import PrimaryButton from '@/Components/Core/PrimaryButton';
import {
  useForm,
  usePage,
} from '@inertiajs/react';

export default function UpdateProfilePictureForm({ className }: { className?: string }) {
  const { user } = usePage().props;

    const { data, setData, post, errors, processing, reset } = useForm({
      profile_picture: null as File | null,
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null); // Ref to access the file input

    // Set image preview when user data or profile_picture is available
    useEffect(() => {
      if (user?.profile_picture) {
        setImagePreview(`/storage/${user.profile_picture}`);
      } else {
        setImagePreview(null);
      }
    }, [user?.profile_picture]);

    const submit: FormEventHandler = (e) => {
      e.preventDefault();

      const formData = new FormData();

      if (data.profile_picture) {
        formData.append('profile_picture', data.profile_picture);
      }

      post(route('profile.picture.update'), {
        data: formData,
        preserveScroll: true,
        onSuccess: () => {
          // Reset form and image preview after successful update
          reset();
          setImagePreview(null); // Clear preview
          if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset file input manually
          }
        },
      });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files ? e.target.files[0] : null;
      if (file) {
        setData('profile_picture', file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string); // Set image preview for selected file
        };
        reader.readAsDataURL(file);
      }
    };

    return (
      <section className={className}>
        <header>
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Update Profile Picture
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Upload a profile picture to personalize your account.
          </p>
        </header>

        <form onSubmit={submit} className="mt-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-full sm:w-1/2">
              <InputLabel htmlFor="profile_picture" value="Profile Picture" />

              <input
                ref={fileInputRef} // Attach ref to file input
                type="file"
                id="profile_picture"
                className="mt-1 block w-full"
                onChange={handleImageChange}
                accept="image/*"
              />

              <InputError message={errors.profile_picture} className="mt-2" />
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-4 sm:mt-0 sm:ml-4 flex justify-center sm:justify-start">
                <img
                  src={imagePreview}
                  alt="Profile Preview"
                  className="w-32 h-32 rounded-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Button to submit */}
          <div className="flex items-center gap-4 mt-4">
            <PrimaryButton disabled={processing}>Save</PrimaryButton>
          </div>
        </form>
      </section>
    );
  }
