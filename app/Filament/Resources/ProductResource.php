<?php

namespace App\Filament\Resources;

use App\Enums\ProductStatusEnum;
use App\Filament\Resources\ProductResource\Pages;
use App\Filament\Resources\ProductResource\Pages\EditProduct;
use App\Filament\Resources\ProductResource\Pages\ProductImages;
use App\Filament\Resources\ProductResource\Pages\ProductVariations;
use App\Filament\Resources\ProductResource\Pages\ProductVariationTypes;
use App\Models\Product;
use Filament\Forms\Components\Section;
use Filament\Pages\SubNavigationPosition;
use App\Enums\RolesEnum;
use Filament\Facades\Filament;
use Filament\Forms;
use Filament\Forms\Components\Grid;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Pages\Page;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;
use Filament\Tables\Columns\SpatieMediaLibraryImageColumn;

class ProductResource extends Resource
{
    protected static ?string $model = Product::class;

    protected static ?string $navigationIcon = 'heroicon-o-cube';

    protected static SubNavigationPosition $subNavigationPosition = SubNavigationPosition::End;

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->forVendor();
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Grid::make(['default' => 1, 'lg' => 2]) // Default 1 column, 2 columns for large devices
                    ->schema([
                        TextInput::make('title')
                            ->live(onBlur: true)
                            ->required()
                            ->afterStateUpdated(function (string $operation, $state, callable $set) {
                                $set('slug', Str::slug($state));
                            })
                            ->columnSpan(1),

                        TextInput::make('slug')
                            ->required()
                            ->columnSpan(1),
                    ]),

                Grid::make(['default' => 1, 'md' => 2, 'lg' => 2]) // Group department and category for medium and large devices
                    ->schema([
                        Select::make('department_id')
                            ->relationship('department', 'name')
                            ->label(__('Department'))
                            ->preload()
                            ->searchable()
                            ->required()
                            ->reactive()
                            ->afterStateUpdated(function (callable $set) {
                                $set('category_id', null);
                            })
                            ->columnSpan(1),

                        Select::make('category_id')
                            ->relationship(
                                name: 'category',
                                titleAttribute: 'name',
                                modifyQueryUsing: function (Builder $query, callable $get) {
                                    $departmentId = $get('department_id');
                                    if ($departmentId) {
                                        $query->where('department_id', $departmentId);
                                    }
                                }
                            )
                            ->label(__('Category'))
                            ->preload()
                            ->searchable()
                            ->required()
                            ->columnSpan(1),
                    ]),

                Grid::make(['default' => 1, 'lg' => 2]) // Two columns for large devices
                    ->schema([
                        RichEditor::make('description')
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

                        Grid::make(['default' => 1, 'lg' => 2]) // Price and Quantity responsive layout
                            ->schema([
                                TextInput::make('price')
                                    ->required()
                                    ->numeric()
                                    ->columnSpan(['default' => 1, 'lg' => 1]),

                                TextInput::make('quantity')
                                    ->integer()
                                    ->required()
                                    ->columnSpan(['default' => 1, 'lg' => 1]),
                            ]),
                    ]),

                Grid::make(['default' => 1, 'lg' => 2]) // Status spans full row
                    ->schema([
                        Select::make('status')
                            ->options(ProductStatusEnum::labels())
                            ->default(ProductStatusEnum::Draft->value)
                            ->columnSpan(2),
                    ]),
                    Section::make('SEO')
                    ->collapsible()
                    ->schema([
                        TextInput::make('meta_title'),
                        TextInput::make('meta_description'),
                    ])
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
            SpatieMediaLibraryImageColumn::make('images')
                ->collection('images')
                ->limit(1)
                ->conversion('thumb')
                ->label('Images'),

                Tables\Columns\TextColumn::make('title')
                ->sortable()
                ->words(10)
                ->searchable(),

                Tables\Columns\TextColumn::make('status')
                ->badge()
                ->colors(ProductStatusEnum::colors())
                ,
                Tables\Columns\TextColumn::make('department.name'),
                Tables\Columns\TextColumn::make('category.name'),
                Tables\Columns\TextColumn::make('created_at')
                ->dateTime(),


            ])
            ->filters([
                SelectFilter::make('status')
                ->options(ProductStatusEnum::labels()),
                SelectFilter::make('department_id')
                ->relationship('department', 'name'),
            ])
            ->actions([
                Tables\Actions\EditAction::make()
                ->tooltip('Edit this product'),
            Tables\Actions\DeleteAction::make()
                ->tooltip('Delete this product'),

            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProducts::route('/'),
            'create' => Pages\CreateProduct::route('/create'),
            'edit' => Pages\EditProduct::route('/{record}/edit'),
            'images' => Pages\ProductImages::route('{record}/images'),
            'variation-types' => Pages\ProductVariationTypes::route('{record}/variation-types'),
            'variations' => Pages\ProductVariations::route('{record}/variations'),


        ];
    }

    public static function getRecordSubNavigation(Page $page): array
    {
        return  $page->generateNavigationItems([
                EditProduct::class,
                ProductImages::class,
                ProductVariationTypes::class,
                ProductVariations::class,
            ]);

    }

    public static function canViewAny() : bool
    {
        $user = Filament::auth()->user();
        if (!$user) {
            return false;
        }
        return $user && $user->hasRole(RolesEnum::Vendor);
    }
}
