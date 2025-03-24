<?php

namespace Database\Seeders;

use App\Enums\VendorStatusEnum;
use App\Models\User;
use App\Enums\RolesEnum;
use App\Models\Vendor;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'User',
            'email'=> 'user@example.com',
        ])->assignRole(RolesEnum::User->value);

       $user= User::factory()->create([
            'name' => 'Vendor',
            'email'=> 'vendor@example.com',
       ]);
       $user->assignRole(RolesEnum::Vendor->value);
       Vendor::factory()->create([
        'user_id' => $user->id,
        'status' => VendorStatusEnum::Approved,
        'store_name' => 'Vendor Store',
        'store_address' => fake()->address(),
        'store_number' => fake()->phoneNumber(),
       ]);

        User::factory()->create([
            'name' => 'Admin',
            'email'=> 'admin@example.com',
        ])->assignRole(RolesEnum::Admin->value);
    }
}
