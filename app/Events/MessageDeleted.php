<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Message;
use App\Http\Resources\MessageResource;

class MessageDeleted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $deletedMessage;
    public $prevMessage;

    /**
     * Create a new event instance.
     */
    public function __construct($deletedMessage, $prevMessage = null)
    {
        $this->deletedMessage = $deletedMessage;
        $this->prevMessage = $prevMessage;
    }

    public function broadcastWith(): array
    {
        return [
            'deletedMessage' => [
                'id' => $this->deletedMessage['id'],
                'sender_id' => $this->deletedMessage['sender_id'],
                'receiver_id' => $this->deletedMessage['receiver_id'],
                'group_id' => $this->deletedMessage['group_id'],
            ],
            'prevMessage' => $this->prevMessage ? new MessageResource($this->prevMessage) : null,
        ];
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [];

        if ($this->deletedMessage['group_id']) {
            $channels[] = new PrivateChannel('message.group.' . $this->deletedMessage['group_id']);
        } else {
            $channels[] = new PrivateChannel('message.user.' . collect([$this->deletedMessage['sender_id'], $this->deletedMessage['receiver_id']])->sort()->implode('-'));
        }

        return $channels;
    }
}
