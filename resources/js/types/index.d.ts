import { Config } from 'ziggy-js';

export interface User {
    id: number;
    name: string;
    email: string;
    profile_picture: string;
    email_verified_at?: string;
    stripe_account_active: boolean;
    vendor: {
        status: string;
        status_label: stringl;
        store_name: string;
        store_address: string;
        cover_image: string;
    };
}

export type Image = {
    id: number;
    thumb: string;
    small: string;
    large: string;
};

export type VariationTypeOption = {
    id: number;
    name: string;
    images: Image[];
    type: VariationType;
};

export type VariationType = {
    options: any;
    id: number;
    name: string;
    type: "Select" | "Radio" | "Image";
    option: VariationTypeOption[];
};

export type Product = {
    id: number;
    title: string;
    slug: string;
    meta_title: string;
    meta_description: string;
    price: number;
    quantity: number;
    image: string;
    images: Image[];
    short_description: string;
    description: string;
    user: {
        id: number;
        name: string;
        store_name: string;
    };
    vendor: {
        id: number;
        store_name: string;
    };
    department: {
        id: number;
        name: string;
        slug: string;
    };
    variationTypes: VariationType[];
    variationTypeOption: VariationTypeOption[];
    variations: Array<{
        id: number;
        variation_type_option_ids: number[];
        quantity: number;
        price: number;
    }>;
};

export type CartItem = {
    user: string;
    id: number;
    product_id: number;
    title: string;
    slug: string;
    price: number;
    quantity: number;
    image: string;
    saved_for_later: boolean;
    isAuthenticated: boolean;
    option_ids: Record<string, number>;
    options: VariationTypeOption[];
};

export type GroupedCartItems = {
    user: User;
    items: CartItem[];
    totalPrice: number;
    totalQuantity: number;
};

export type PaginationProps<T> = {
    data: Array<T>;
};
export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>
> = T & {
    appName:string;
    csrf_token: string;
    error: string;
    success: {
        message: string;
        time: number;
    };
    auth: {
        user: User;
    };
    ziggy: Config & { location: string };
    totalQuantity: number;
    totalPrice: number;
    miniCartItems: CartItem[];
    departments: Department[];
    user: User;
    addresses: Address[] | [];
    keyword: string;
};

export type OrderItem = {
    id: number;
    quantity: number;
    price: number;
    variation_type_option_ids: number[];
    product: {
        id: number;
        title: string;
        slug: string;
        description: string;
        image: string;
    };
    variations?: Record<string, string[]>; // Add this line

};

export type Order = {
    id: number;
    total_price: number;
    price:number;
    status: string;
    created_at: string;
    tracking_number: string;
    shipping_status: string;
    estimated_delivery?: string;
    vendorUser: {
        id: string;
        name: string;
        email: string;
        store_name: string;
        store_address: string;
    };
    orderItems: OrderItem[];
    order_items: OrderItem[];
    address: Address;
    updated_at: string;
};
export type OrderTracking = {
    order_id: number;
    tracking_number: string;
    carrier: string;
    status: string;
    estimated_delivery: string;
    shipped_at: string;
};

export type Vendor = {
    id: number;
    store_name: string;
    store_address: string;
};

export type Category = {
    id: number;
    name: string;
}

export type Department = {
    id: number;
    name: string;
    slug :string;
    meta_title: string;
    meta_description: string;
    categories: Category[]
}

export type Address ={
    id: number;
    country: string;
    full_name: string;
    phone_number: number;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    zip_code: number;
    isDefault?: boolean;
    delivery_instruction?: string;
    user: User[];
}

export type Members ={
    id: number;
    name: string;
    role: string;
    description: string;
    image: string;
}
