<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Conversation;
use Illuminate\Support\Facades\Auth;

class HomeController extends Controller
{
    public function home()
    {
        $conversations = Conversation::getConversationsForSidebar(Auth::user());

        return inertia('Home', [
            'conversations' => $conversations
        ]);
    }
}
