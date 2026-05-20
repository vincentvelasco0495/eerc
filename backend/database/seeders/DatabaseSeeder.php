<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            LmsDemoSeeder::class,
            HomepageV2SectionSeeder::class,
            AboutPageSectionSeeder::class,
            ContactPageSectionSeeder::class,
            RolePagePermissionSeeder::class,
        ]);
    }
}
