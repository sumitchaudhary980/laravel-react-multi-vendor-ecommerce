<?php

namespace App\Filament\Resources\ProductResource\Pages;

use App\Enums\ProductVariationTypeEnum;
use App\Filament\Resources\ProductResource;
use Filament\Actions;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Resources\Pages\EditRecord;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;


class ProductVariationTypes extends EditRecord
{
    protected static string $resource = ProductResource::class;

    protected static ?string $title = "Variation Types";
    protected static ?string $navigationIcon= 'heroicon-m-numbered-list';

    public function form(Form $form): Form
    {
        return $form
        ->schema([
            Repeater::make('variationTypes')
            ->label(false)
            ->relationship()
            ->collapsible()
            ->defaultItems(1)
            ->addActionLabel('Add new variation type')
            ->columns(2)
            ->columnSpan(2)
            ->schema([
                TextInput::make('name')
                ->required(),
                Select::make('type')
                ->options(ProductVariationTypeEnum::labels())
                ->required()
                ->reactive(),
                Repeater::make('options')
                ->relationship()
                ->collapsible()
                ->schema([
                    TextInput::make('name')
                    ->columnSpan(2)
                    ->required(),
                    SpatieMediaLibraryFileUpload::make('images')
                    ->image()
                    ->multiple()
                    ->openable()
                    ->panelLayout('grid')
                    ->collection('images')
                    ->reorderable()
                    ->appendFiles()
                    ->preserveFilenames(false)
                    ->columnSpan(3)
                    ->visible(fn ($get) => $get('../../type') === 'Image'), // Ensure type is 'Image'

                ])
                ->columnSpan(2)
            ])
        ]);
    }

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
