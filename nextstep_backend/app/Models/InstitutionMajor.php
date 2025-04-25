<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InstitutionMajor extends Model
{
    protected $table = 'institution_major';

    public function institution()
    {
        return $this->belongsTo(Institution::class);
    }

    public function major()
    {
        return $this->belongsTo(Major::class);
    }
}
