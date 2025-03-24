<?php

namespace App\Filament\Resources;

use App\Enums\RolesEnum;
use App\Filament\Resources\UserResource\Pages;
use App\Filament\Resources\UserResource\RelationManagers;
use App\Models\User;
use Filament\Facades\Filament;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';
    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->forUser();
    }



    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')
                    ->sortable()
                    ->searchable(),

                TextColumn::make('name')
                    ->sortable()
                    ->searchable(),

                ImageColumn::make('profile_picture')
                    ->label('Profile Picture')
                    ->circular()
                    ->getStateUsing(
                        fn($record) => $record->profile_picture
                        ? asset('storage/' . $record->profile_picture)
                        : 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp'
                    ),


                TextColumn::make('email')
                    ->sortable()
                    ->searchable(),

                TextColumn::make('usertype')
                    ->label('User Type')
                    ->sortable(false)
                    ->badge()
                    ->color(fn($record) => $record->usertype === 'vendor' ? 'success' : 'info'),

                    TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->getStateUsing(fn ($record) => $record->email_verified_at ? 'Verified' : 'Not Verified')
                    ->color(fn ($record) => $record->email_verified_at ? 'success' : 'danger')
            ])
            ->filters([
                //
            ])
            ->actions([

            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
        ];
    }
    public static function canCreate(): bool
    {
        return false; // Return false to disable the "New User" button in navigation
    }

    public static function canViewAny() : bool
    {
        $user = Filament::auth()->user();
        return $user && $user->hasRole(RolesEnum::Admin);
    }
}
