<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'publisher',
        'icon',
        'banner',
        'category_tag',
        'is_popular',
    ];

    protected $casts = [
        'is_popular' => 'boolean',
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
