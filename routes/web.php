<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\GroupController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;
use App\Models\User;
use App\Http\Resources\UserResource;
use App\Http\Resources\GroupResource;
use App\Http\Controllers\UserController;
use App\Models\Group;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [HomeController::class , 'home'])->name('dashboard');


    Route::get('/user/{user}', [MessageController::class, 'byUser'])->name('chat.user');
    Route::get('/group/{group}', [MessageController::class, 'byGroup'])->name('chat.group');


    Route::post('/message/store', [MessageController::class, 'store'])->name('message.store');
    Route::delete('/message/{message}', [MessageController::class, 'destroy'])->name('message.destroy');
    Route::get('/message/older/{message}', [MessageController::class, 'loadOlder'])->name('message.older');

   Route::post('/group', [GroupController::class, 'store'])->name('group.store');
   Route::put('/group/{group}', [GroupController::class, 'update'])->name('group.update');
   Route::delete('/group/{group}', [GroupController::class, 'destroy'])->name('group.destroy');
   Route::middleware(['admin'])->group(function () {

    Route::post('/user',[UserController::class,'store'])->name('user.store');
     Route::post('/user/change-role/{user}',[UserController::class,'changeRole'])->name('user.changeRole');
      Route::post('/user/block-unblock/{user}',[UserController::class,'blockUnblock'])->name('user.blockUnblock');




});
});
// Broadcast authentication route
Broadcast::routes(['middleware' => ['auth']]);

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/dashboard', [HomeController::class, 'home'])->name('dashboard');
    Route::get('/user/{user}', [MessageController::class, 'byUser'])->name('chat.user');
    Route::get('/group/{group}', [MessageController::class, 'byGroup'])->name('chat.group');

    Route::post('/message', [MessageController::class, 'store'])->name('messages.store');
});

require __DIR__.'/auth.php';
