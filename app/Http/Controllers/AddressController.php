<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AddressController extends Controller
{
    public function address()
    {
        $user = Auth::user();
        $address = Address::where('user_id', $user->id)->get();
        return Inertia::render('Order/ShippingAddress', [
            'address' => $address,
        ]);
    }

    public function store(Request $request)
    {
        // Create a new address and store data
        $address = new Address();
        $address->country = $request->input('country');
        $address->full_name = $request->input('full_name');
        $address->phone_number = $request->input('phone_number');
        $address->address_line_1 = $request->input('address_line_1');
        $address->address_line_2 = $request->input('address_line_2');
        $address->city = $request->input('city');
        $address->state = $request->input('state');
        $address->zip_code = $request->input('zip_code');
        $address->isDefault = $request->input('is_default') ? true : false;
        $address->delivery_instruction = $request->input('delivery_instruction');
        $address->user_id = auth()->id(); // Store logged-in user ID

        // Save the address
        $address->save();

        // Redirect with success message
        return redirect()->route('address.show')->with('success', 'Address added successfully.');
    }



    public function update_address(Request $request)
    {
        // Find the address by ID
        $address = Address::findOrFail($request->input('id'));

        $user = Auth::user();
        if ($address->user_id != $user->id) {
            return redirect()->route('address.show')->with('error', 'Unauthorized action.');
        }

        // Manually update the address data
        $address->full_name = $request->input('full_name');
        $address->phone_number = $request->input('phone_number');
        $address->address_line_1 = $request->input('address_line_1');
        $address->address_line_2 = $request->input('address_line_2', '');
        $address->city = $request->input('city');
        $address->state = $request->input('state');
        $address->zip_code = $request->input('zip_code');
        $address->country = $request->input('country');
        $address->isDefault = $address->isDefault;
        $address->delivery_instruction = $request->input('delivery_instruction', '');

        // Save the updated address
        $address->save();

        // Redirect back with success message
        return redirect()->route('address.show')->with('success', 'Address updated successfully!');
    }

    public function delete_address($id)
    {
        $address = Address::findOrFail($id);
        $address->delete();
        return redirect()->route('address.show')->with('success', 'Address deleted successfully!');

    }

    public function default_address($id)
    {
        $user = Auth::user();
        Address::where('user_id', $user->id)->update(['isDefault' => false]);

        $address = Address::where('user_id', $user->id)->findOrFail($id);
        $address->isDefault = true;
        $address->save();

        return redirect()->route('address.show')->with('success', 'Default address updated successfully!');
    }
}
