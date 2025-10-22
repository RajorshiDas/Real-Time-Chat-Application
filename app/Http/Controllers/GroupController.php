<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Http\Requests\StoreGroupRequest;
use App\Http\Requests\UpdateGroupRequest;
use Illuminate\Http\Request;
use App\Jobs\DeleteGroupJob;

class GroupController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreGroupRequest $request)
    {
        $data = $request->validated();

        // Get user IDs from the request or empty array if none
        $user_ids = $data['user_ids'] ?? [];

        // Make sure the current user is included in the group
        $allUserIds = array_unique(array_merge([$request->user()->id], $user_ids));

        // Create the group
        $group = Group::create($data);

        // Attach all users at once, no duplicates
        $group->users()->attach($allUserIds);

        return redirect()->back();
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateGroupRequest $request, Group $group)
    {
        $data = $request->validated();
        $user_ids = $data['user_ids'] ?? [];

        // Update group data
        $group->update($data);

        // Prepare unique user IDs including current user
        $allUserIds = array_unique(array_merge([$request->user()->id], $user_ids));

        // Detach existing users and attach new ones in one step using sync
        $group->users()->sync($allUserIds);

        return redirect()->back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Group $group)
    {
        // Check if the user is the owner of the group
        if ($group->owner_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        DeleteGroupJob::dispatch($group)->delay(now()->addSeconds(5));

        return response()->json(['message' => 'Group delete was scheduled and will be deleted soon.']);
    }
}
