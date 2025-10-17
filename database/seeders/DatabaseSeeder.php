<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Group;
use App\Models\Message;
use App\Models\Conversation;
use Carbon\Carbon;


// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {


           // Ensure these users exist (idempotent) so repeated seeding won't fail
           User::firstOrCreate(
               ['email' => 'rajorshi@email.com'],
               [
                   'name' => 'Rajorshi Das',
                   'password' => bcrypt('12345678'),
                   'is_admin' => true,
                   'email_verified_at' => now(),
               ]
           );

           User::firstOrCreate(
               ['email' => 'john@email.com'],
               [
                   'name' => 'John Doe',
                   'password' => bcrypt('password'),
                   'is_admin' => false,
                   'email_verified_at' => now(),
               ]
           );
            User::factory(10)->create();
           for ($i = 0; $i < 5; $i++) {
            $group = Group::factory()->create([
                'owner_id' => 1,
            ]);
            $users = User::inRandomOrder()->limit(rand(2, 5))->pluck('id');
            $group->users()->attach(array_unique([1, ...$users]));
            }
              Message::factory(1000)->create();
              $messages = Message::whereNull('group_id')->orderBy('created_at')->get();

                $conversations = $messages->groupBy(function ($message) {
                return collect([$message->sender_id, $message->receiver_id])->sort()->implode('_');
              })->map(function ($groupedMessages) {
                return [
                    'user_id1' => min($groupedMessages->first()->sender_id, $groupedMessages->first()->receiver_id),
                    'user_id2' => max($groupedMessages->first()->sender_id, $groupedMessages->first()->receiver_id),
                    'created_at' => new Carbon(),
                    'updated_at' => new Carbon(),
                ];
              })->values();

            Conversation::insertOrIgnore($conversations->toArray());

            // THIS IS THE MISSING PART - LINK MESSAGES TO CONVERSATIONS
            $createdConversations = Conversation::all();

            foreach ($createdConversations as $conversation) {
                // Find messages between these two users
                $conversationMessages = Message::where(function($query) use ($conversation) {
                    $query->where('sender_id', $conversation->user_id1)
                          ->where('receiver_id', $conversation->user_id2);
                })->orWhere(function($query) use ($conversation) {
                    $query->where('sender_id', $conversation->user_id2)
                          ->where('receiver_id', $conversation->user_id1);
                })->whereNull('group_id')->get();

                // Link these messages to this conversation
                foreach ($conversationMessages as $message) {
                    $message->update(['conversation_id' => $conversation->id]);
                }

                // Set the last_message_id for this conversation
                $lastMessage = $conversationMessages->sortByDesc('created_at')->first();
                if ($lastMessage) {
                    $conversation->update(['last_message_id' => $lastMessage->id]);
                }
            }

            // Set last_message_id for groups too
            $groups = Group::all();
            foreach ($groups as $group) {
                $lastMessage = Message::where('group_id', $group->id)
                                     ->orderBy('created_at', 'desc')
                                     ->first();
                if ($lastMessage) {
                    $group->update(['last_message_id' => $lastMessage->id]);
                }
            }
    }


}
