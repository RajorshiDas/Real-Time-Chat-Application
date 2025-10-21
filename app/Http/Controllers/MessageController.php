<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Message;
use App\Models\Conversation;
use App\Models\Group;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Events\SocketMessage;
use App\Models\MessageAttachment;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
public function byUser(User $user)
{
    $message = Message::where('sender_id', auth()->id())
    ->where('receiver_id', $user->id)
    ->orwhere('sender_id', $user->id)
    ->where('receiver_id', auth()->id())
    ->latest()
    ->paginate(10);

    return inertia('Home', [
        'selectedConversation' => $user->toConversationArray(),
        'messages' => MessageResource::collection($message),
    ]);

}
public function byGroup(Group $group)
{
    $message = Message::where('group_id', $group->id)
        ->latest()
        ->paginate(50);

    return inertia('Home', [
        'selectedConversation' => $group->toConversationArray(),  // Add quotes
        'messages' => MessageResource::collection($message),       // Add quotes
    ]);
}
public function loadOlder(Message $message)
{

if ($message->group_id) {
    $messages = Message::where('created_at', '<', $message->created_at)
        ->where('group_id', $message->group_id)
        ->latest()

        ->paginate(10);
} else {
    $messages = Message::where('created_at', '<', $message->created_at)
        ->where(function ($query) use ($message) {
            $query->where('sender_id', $message->sender_id)
                  ->where('receiver_id', $message->receiver_id)
                  ->orWhere('sender_id', $message->receiver_id)
                  ->where('receiver_id', $message->sender_id);
        })
        ->latest()
        ->paginate(10);
}
    return MessageResource::collection($messages);


}
    public function store(StoreMessageRequest $request)
    {
        $data = $request->validated();
        $data['sender_id'] = auth()->id();
        $receiverId = $data['receiver_id'] ?? null;
        $groupId = $data['group_id'] ?? null;


        $message = Message::create($data);

        $attachments = [];


        $files = $request->file('attachments', []);
        if (!empty($files)) {
            foreach ($files as $file) {
                $directory = 'attachments/' . Str::random(32);
                Storage::makeDirectory($directory);

                $path = $file->store($directory, 'public');

                $model = [
                    'message_id' => $message->id,
                    'name' => $file->getClientOriginalName(),
                    'mime' => $file->getClientMimeType(),
                    'size' => $file->getSize(),
                    'path' => $path,
                ];

                $created = MessageAttachment::create($model);
                $attachments[] = $created;
            }


            $message->setRelation('attachments', collect($attachments));
        }

        if ($receiverId) {
            Conversation::updateConversationWithMessage($receiverId, auth()->id(), $message);
        }

        if ($groupId) {
            Group::updateGroupWithMessage($groupId, $message);
        }


        $message->loadMissing('sender', 'attachments');

        SocketMessage::dispatch($message);

        return new MessageResource($message);
    }
public function destroy(Message $message)
{
    try {
        DB::beginTransaction();

        // Check if user can delete the message
        if ($message->sender_id !== auth()->id()) {
            return response()->json(['message' => 'You cannot delete this message'], 403);
        }

        // Update conversations that reference this message as last_message
        Conversation::where('last_message_id', $message->id)
            ->each(function ($conversation) use ($message) {
                // Find previous message for this conversation
                $prevMessage = Message::where('id', '!=', $message->id)
                    ->when($conversation->group_id, function ($query) use ($conversation) {
                        return $query->where('group_id', $conversation->group_id);
                    }, function ($query) use ($conversation) {
                        return $query->where(function ($q) use ($conversation) {
                            $q->where(function ($inner) use ($conversation) {
                                $inner->where('sender_id', $conversation->user_id)
                                    ->where('receiver_id', $conversation->other_user_id);
                            })->orWhere(function ($inner) use ($conversation) {
                                $inner->where('sender_id', $conversation->other_user_id)
                                    ->where('receiver_id', $conversation->user_id);
                            });
                        });
                    })
                    ->latest()
                    ->first();

                // Update conversation with previous message or null
                $conversation->update(['last_message_id' => $prevMessage ? $prevMessage->id : null]);
            });

        // Delete attachments if any
        if ($message->attachments && $message->attachments->count() > 0) {
            foreach ($message->attachments as $attachment) {
                if ($attachment->path && Storage::disk('public')->exists($attachment->path)) {
                    Storage::disk('public')->delete($attachment->path);
                }
                $attachment->delete();
            }
        }

        // Get the previous message for response
        $prevMessage = Message::where('id', '!=', $message->id)
            ->when($message->group_id, function ($query) use ($message) {
                return $query->where('group_id', $message->group_id);
            }, function ($query) use ($message) {
                return $query->where(function ($q) use ($message) {
                    $q->where(function ($inner) use ($message) {
                        $inner->where('sender_id', $message->sender_id)
                            ->where('receiver_id', $message->receiver_id);
                    })->orWhere(function ($inner) use ($message) {
                        $inner->where('sender_id', $message->receiver_id)
                            ->where('receiver_id', $message->sender_id);
                    });
                });
            })
            ->latest()
            ->first();

        // Delete the message
        $message->delete();

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => $prevMessage ? new MessageResource($prevMessage) : null
        ]);

    } catch (\Exception $e) {
        DB::rollBack();

        return response()->json([
            'success' => false,
            'message' => 'Error deleting message: ' . $e->getMessage()
        ], 500);
    }
}
}
