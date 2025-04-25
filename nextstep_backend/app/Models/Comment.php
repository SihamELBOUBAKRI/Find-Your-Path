<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    // app/Models/Comment.php

public function user()
{
    return $this->belongsTo(User::class);
}

public function post()
{
    return $this->belongsTo(Post::class);
}

public function replies()
{
    return $this->hasMany(Comment::class, 'parent_id');
}

public function parent()
{
    return $this->belongsTo(Comment::class, 'parent_id');
}
}
