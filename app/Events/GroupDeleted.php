<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GroupDeleted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public int $id, public string $name)
    {
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('group.deleted.'.$this->id),
        ];
    }

    public function broadcastAs()
    {
        return 'GroupDeleted';
    }
}
