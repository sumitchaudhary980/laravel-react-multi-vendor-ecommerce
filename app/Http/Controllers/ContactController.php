<?php

namespace App\Http\Controllers;


use App\Http\Resources\MemberResource;
use App\Models\Member;
use Illuminate\Http\Request;
use Inertia\Inertia;
class ContactController extends Controller
{
    public function contact()
    {

        return Inertia::render('Contact');
     }
     public function sendMessage(Request $request)
     {
        $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:255', 'regex:/^[A-Za-z]+$/'],
            'email' => 'required|string|lowercase|email|max:255',
            'subject' => ['required', 'string', 'min:2', 'max:255', 'regex:/^[A-Za-z0-9]+$/'],
            'message' => ['required', 'string', 'min:2', 'max:255', 'regex:/^[A-Za-z0-9]+$/'],

        ], [
            'name.regex' => 'Name must contain only alphabets',
        ]);
     }

     public function about()
     {
        $about = Member::all();
        return Inertia::render('About',[
            'about' => MemberResource::collection($about),
        ]);
     }
}
