=1
Get-Content 'src/components/restaurant-detail/RestaurantDetailView.tsx' | ForEach-Object {
  if ( -ge 40 -and  -le 140) {
    Write-Host (.ToString() + ': ' + )
  }
  ++
}
