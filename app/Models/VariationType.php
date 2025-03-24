<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
class VariationType extends Model
{
    public $timestamps = false;
    public function options(): HasMany
    {
        return $this->hasMany(VariationTypeOption::class,'variation_type_id');
    }
    public function media()
{
    return $this->morphMany(
        Media::class, 'model');
}

}
