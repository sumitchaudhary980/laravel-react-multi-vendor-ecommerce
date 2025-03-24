<?php

namespace App\Filament\Resources;

use App\Enums\RolesEnum;
use App\Enums\VendorStatusEnum;
use App\Filament\Resources\VendorResource\Pages;
use App\Filament\Resources\VendorResource\RelationManagers;
use App\Models\Vendor;
use Filament\Tables\Actions\Action;
use Filament\Facades\Filament;
use Filament\Forms;
use Filament\Forms\Components\Grid;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use App\Mail\VendorStatusChangeMail;
use Filament\Tables;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Mail;

class VendorResource extends Resource
{
    protected static ?string $model = Vendor::class;

    protected static ?string $navigationIcon = 'heroicon-o-briefcase'; // Icon for Vendors

    public static function form(Form $form): Form
    {
        return $form

            ->schema([
                Grid::make(['default' => 1, 'lg' => 2])
                    ->schema([
                        TextInput::make('store_name')
                            ->label(__('Store Name'))
                            ->required()
                            ->reactive()
                            ->columnSpan(2),
                    ]),


                Grid::make(['default' => 1, 'lg' => 2]) // Two columns for large devices
                    ->schema([
                        RichEditor::make('store_address')
                            ->required()
                            ->toolbarButtons([
                                'blockquote',
                                'bold',
                                'bulletList',
                                'h2',
                                'h3',
                                'italic',
                                'link',
                                'orderedList',
                                'redo',
                                'strike',
                                'underline',
                                'undo',
                                'table',
                            ])
                            ->columnSpan(2), // Spans entire row regardless of screen size



                    ]),

                    Grid::make(['default' => 1, 'lg' => 2]) // Status spans full row
                            ->schema([
                                TextInput::make('store_number')
                                    ->required()
                                    ->numeric()
                                    ->label('Phone Number')
                                    ->columnSpan(2),
                            ]),


                Grid::make(['default' => 1, 'lg' => 2]) // Status spans full row
                    ->schema([
                        Select::make('status')
                            ->options(VendorStatusEnum::labels())
                            ->default(VendorStatusEnum::Pending->value)
                            ->columnSpan(2),
                    ]),

            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('store_name')
                    ->label('Store Name')
                    ->sortable()
                    ->searchable(),

                TextColumn::make('store_address')
                    ->label('Store Address')
                    ->searchable()
                    ->html(),

                TextColumn::make('store_number')
                    ->label('Phone Number')
                    ->searchable(),

                TextColumn::make('status')
                    ->badge()
                    ->colors(VendorStatusEnum::colors())
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                //
            ])
            ->actions([

                   //custom actions
                   Action::make('approve')
                   ->label('Approve')
                   ->icon('heroicon-o-check-circle')
                   ->color('success')
                   ->requiresConfirmation()
                   ->hidden(fn ($record) => $record->status === VendorStatusEnum::Approved->value) // Hide if already approved
                   ->action(function ($record) {
                    $record->update(['status' => VendorStatusEnum::Approved->value]);
                    // Send the approval email
                    Mail::to($record->email)
                        ->send(new VendorStatusChangeMail($record, 'Approved'));
                }),

                   Action::make('reject')
                   ->label('Reject')
                   ->icon('heroicon-o-x-circle')
                   ->color('danger')
                   ->requiresConfirmation()
                   ->hidden(fn ($record) => $record->status === VendorStatusEnum::Rejected->value) //// Hide if already rejected
                   ->action(function ($record) {
                    $record->update(['status' => VendorStatusEnum::Rejected->value]);

                    // Send the approval email
                    Mail::to($record->email)
                        ->send(new VendorStatusChangeMail($record, 'Rejected'));
                }),

                Tables\Actions\EditAction::make()
                ->tooltip('Edit this vendor'),
            Tables\Actions\DeleteAction::make()
                ->tooltip('Delete this vendor'),


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
            'index' => Pages\ListVendors::route('/'),
            'create' => Pages\CreateVendor::route('/create'),
            'edit' => Pages\EditVendor::route('/{record}/edit'),
        ];
    }

    public static function canViewAny(): bool
    {
        $user = Filament::auth()->user();
        return $user && $user->hasRole(RolesEnum::Admin);
    }
}
