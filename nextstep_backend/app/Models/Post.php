<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Post extends Model
{
    // app/Models/Post.php
protected $fillable = [
        'content',
        'slug',
        'tags'
    ];
protected $casts = [
    'tags' => 'array' // This will auto-convert between array and JSON
];
public function user()
{
    return $this->belongsTo(User::class);
}

public function comments()
{
    return $this->hasMany(Comment::class);
}

public function likers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'post_user_likes')
            ->withTimestamps();
    }

    public function toggleLike()
    {
        $user = auth()->user();
        
        if ($this->likers()->where('user_id', $user->id)->exists()) {
            $this->likers()->detach($user->id);
            $this->decrement('likes');
            return false; // Unlike
        } else {
            $this->likers()->attach($user->id);
            $this->increment('likes');
            return true; // Like
        }
    }
}
