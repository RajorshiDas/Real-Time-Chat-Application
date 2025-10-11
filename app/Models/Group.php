<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\User;
use App\Models\Message;
use App\Models\Conversation;


class Group extends Model
{
    /** @use HasFactory<\Database\Factories\GroupFactory> */
    use HasFactory;
    protected $fillable = [
        'name',
        'description',
        'owner_id',
        'last_message_id',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'group_user');
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
   public static function getGroupsForUser(User $user)
   {
       $query = self::select(['groups.*', 'messages.message as last_message', 'messages.created_at as last_message_date'])
           ->join('group_user', 'group_user.group_id', '=', 'groups.id')
           ->where('group_user.user_id', $user->id)
           ->leftJoin('messages', 'messages.id', '=', 'groups.last_message_id')
           ->where('group_user.user_id', $user->id)
           ->orderBy('messages.created_at', 'desc')
           ->orderBy('groups.name');

                return $query->get();
   }

    public function toConversationArray()
    {
         return [
                'id' => $this->id,
                'name' => $this->name,
                'description' => $this->description,
                'is_group' => true,
                'is_user' => false,
                'owner_id' => $this->owner_id,
                'users' => $this->users,
                'user_ids' => $this->users->pluck('id'),
                'created_at' => $this->created_at,
                'updated_at' => $this->updated_at,
                'last_message' => $this->last_message,
                'last_message_date' => $this->last_message_date ? $this->last_message_date.' UTC' : null,
         ];

        }

  public static function updateGroupWithMessage($groupId, Message $message)
    {
        return self::updateOrCreate(
            ['id' => $groupId],
            ['last_message_id' => $message->id]
        );
}
}
