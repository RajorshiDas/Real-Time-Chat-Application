<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use App\Models\Group;
use App\Events\GroupDeleted;

class DeleteGroupJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public Group $group)
    {

    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {

        $id = $this->group->id;
        $name = $this->group->name;
        $this->group->last_message_id = null;
        $this->group->save();

        //iteration over all messages and delete them
        $this->group->messages->each->delete();
        //Romove all users from the group
        $this->group->users()->detach();
        //Finally delete the group
        $this->group->delete();

        GroupDeleted::dispatch($id ,$name);



    }
}
