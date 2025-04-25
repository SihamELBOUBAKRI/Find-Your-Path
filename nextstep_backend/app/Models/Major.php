<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Major extends Model
{
    // app/Models/Major.php

public function institutions()
{
    return $this->belongsToMany(Institution::class, 'institution_major')
               ->withPivot(['duration', 'requirements'])
               ->withTimestamps();
}
}
