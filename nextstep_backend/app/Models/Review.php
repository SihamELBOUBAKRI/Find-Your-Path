<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    // app/Models/Review.php

public function user()
{
    return $this->belongsTo(User::class);
}

public function institution()
{
    return $this->belongsTo(Institution::class);
}
}
