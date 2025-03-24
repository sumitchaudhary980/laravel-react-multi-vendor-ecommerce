import React, {
  FormEventHandler,
  useState,
} from 'react';

import {
  Bars3Icon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import {
  Link,
  useForm,
  usePage,
} from '@inertiajs/react';

import { MiniCartDropdown } from './MiniCartDropdown';

function Navbar() {
    const { departments, keyword } = usePage().props;
    const { user } = usePage().props;
    const [menuOpen, setMenuOpen] = useState(false);

    const searchForm = useForm<{ keyword: string }>({
        keyword: keyword || "",
    });

    const { url } = usePage();

    const onSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (searchForm.data.keyword.trim() === "") {
            alert("Please enter a search keyword.");
            return;
        }
        searchForm.get(url, { preserveScroll: true, preserveState: true });
    };

    return (
        <>
            {/* Top Navbar (Logo + Login/Register + Cart) */}
            <div className="navbar bg-base-100 p-4 shadow-md flex items-center justify-between relative">
                <Link href="/" className="text-xl font-bold">
                    Buyzon
                </Link>
                <div className="flex items-center gap-3">
                    {/* Search bar for medium and large devices */}
                    <div className="hidden md:flex items-center mr-3">
                        <form
                            onSubmit={onSubmit}
                            className="flex w-full max-w-xs"
                        >
                            <input
                                value={searchForm.data.keyword}
                                onChange={(e) =>
                                    searchForm.setData(
                                        "keyword",
                                        e.target.value
                                    )
                                }
                                className="input input-bordered w-full"
                                placeholder="Search"
                            />
                            <button className="btn btn-primary">
                                <MagnifyingGlassIcon className="w-5 h-5" />
                            </button>
                        </form>
                    </div>

                    <MiniCartDropdown />
                    {user ? (
                        <div className="dropdown dropdown-end">
                            <div
                                tabIndex={0}
                                role="button"
                                className="btn btn-ghost btn-circle avatar"
                            >
                                <img
                                    alt="Profile"
                                    src={
                                        user.profile_picture
                                            ? `/storage/${user.profile_picture}`
                                            : "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                                    }
                                    className="w-10 rounded-full"
                                />
                            </div>
                            <ul className="menu dropdown-content bg-base-100 rounded-box mt-3 w-52 p-2 shadow z-50">
                                <li>
                                    <Link href={route("profile.edit")}>
                                        Profile
                                    </Link>
                                </li>
                                <li>
                                    <Link href={route("order.show")}>
                                        Orders
                                    </Link>
                                </li>
                                {user &&
                                    user.vendor &&
                                    user.vendor.status === "approved" && (
                                        <li>
                                            <a
                                                href={route(
                                                    "filament.admin.pages.dashboard"
                                                )}
                                            >
                                                Vendor Area
                                            </a>
                                        </li>
                                    )}

                                <li>
                                    <Link
                                        href={route("logout")}
                                        method="post"
                                        as="button"
                                    >
                                        Logout
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    ) : (
                        <>
                            <Link href={route("login")} className="btn">
                                Login
                            </Link>
                            <Link
                                href={route("register")}
                                className="btn btn-primary"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Departments Dropdown for medium and large screens */}
            <div className="hidden md:block">
                <div className="bg-base-100 border-t p-3">
                    <ul className="flex gap-4">
                        {departments.map((department) => (
                            <li key={department.id}>
                                <Link
                                    href={route(
                                        "product.byDepartment",
                                        department.slug
                                    )}
                                    className={`hover:text-primary ${
                                        url.includes(department.slug)
                                            ? "text-primary"
                                            : ""
                                    }`}
                                >
                                    {department.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Bottom Navbar (Hamburger + Search Bar for small devices) */}
            <div className="navbar bg-base-100 border-t flex items-center gap-2 p-3 relative md:hidden">
                <button
                    className="btn btn-ghost md:hidden flex items-center"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <Bars3Icon className="w-6 h-6" />
                </button>

                <div className="flex-1">
                    <form onSubmit={onSubmit} className="flex w-full">
                        <input
                            value={searchForm.data.keyword}
                            onChange={(e) =>
                                searchForm.setData("keyword", e.target.value)
                            }
                            className="input input-bordered w-full"
                            placeholder="Search"
                        />
                        <button className="btn btn-primary">
                            <MagnifyingGlassIcon className="w-5 h-5" />
                        </button>
                    </form>
                </div>

                {/* Departments Dropdown for small screens */}
                {menuOpen && (
                    <div className="absolute top-full left-0 w-full bg-base-100 border-t p-3 z-10">
                        <ul className="flex flex-col gap-4">
                            {departments.map((department) => (
                                <li key={department.id}>
                                    <Link
                                        href={route(
                                            "product.byDepartment",
                                            department.slug
                                        )}
                                        className={`hover:text-primary ${
                                            url.includes(department.slug)
                                                ? "text-primary"
                                                : ""
                                        }`}
                                    >
                                        {department.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </>
    );
}

export { Navbar };
