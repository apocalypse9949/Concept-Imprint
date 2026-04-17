$urls = @(
    @{ name="splash_screen.png"; url="https://lh3.googleusercontent.com/aida/ADBb0uj15NL4T7bDJaMgkhkVzEd8Io1MxwIgob10aKpKq5zAvqRZlgV0sVuP7gGMMQ3DbI6IQUa8LV9jMOu8IRnbtixK5RiwGqO5NIF4D4T_uP1_dOXAq_TX0lBZfGlBw5nK7Sw8Ng5jRScDBCkt4Nkm0Pgdym52XpQbbeD_8lOIMFNCWUA0WyhMlbWUncZ6rz8F4Srwe1JLdnm5rSWLCSaYrH5lf-jCS_B3hmvi4RtVTwdQjaE3-0TdFFFXAg" },
    @{ name="splash_screen.html"; url="https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzkyOTE4ZjU1ZjY0YjQ5NDFiOGY1NDliNzM5ZWNjMWZmEgsSBxCGvsjeqAgYAZIBIgoKcHJvamVjdF9pZBIUQhI1Njk0OTIyMzExNDg3MDg2OTM&filename=&opi=89354086" },
    @{ name="idea_grid.png"; url="https://lh3.googleusercontent.com/aida/ADBb0uimYWSoxRjA8k46ejZGGfyaj7Sg_uahwJTvZNpWZuk-SMARE_oWS-SjXSoAVTofY2PFUeYWGilnRuQFVhHrpbuqyjjOjhPqxT7odMWICaiPEqdc6Y9cKp72uwkNVswsdHmTh43nneuyd2SGdfGhTWb3DXR3bwM9XyNuRybMT1QGpzKNaEzc2SdLt5Y8dvwp7PMuffSBH6BMX7c4OJ3hlfEzGZhYS5mp2oCRZ6uBhnwAcEiRGtnByTcO" },
    @{ name="idea_grid.html"; url="https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sX2U2ZDkyNjU3NjkzZTQ2YjU4OWJmN2ZkMWI5NTQ5N2QyEgsSBxCGvsjeqAgYAZIBIgoKcHJvamVjdF9pZBIUQhI1Njk0OTIyMzExNDg3MDg2OTM&filename=&opi=89354086" },
    @{ name="idea_detail.png"; url="https://lh3.googleusercontent.com/aida/ADBb0ugQnAv1L-yYyxaLhlNG6wcMZgW9c-hEpDz7IRZUTVuwXFUohU6MhkdHXFgnvLUnUxfHTbnjqOJA043U7hW2FaguFikxWSIGAf55xvIXcaC1qGboVBZ_xrG9sb1T5qkwMLO2WnADhKidUKyj3e1x1NDx0i3jJBT-bY1I_JRgTEq05mGbVeHm8mwJJYzLuKd_4hoI0BQJ5yur1Lx-BxKvEmVtJ4s8A2LnpiKFQxKTdzh-yVZkmVcdVYV_" },
    @{ name="idea_detail.html"; url="https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzJmZTg2MDBhZjc4OTQ4YjJhNjI4YjczMzcxNmUzM2U2EgsSBxCGvsjeqAgYAZIBIgoKcHJvamVjdF9pZBIUQhI1Njk0OTIyMzExNDg3MDg2OTM&filename=&opi=89354086" },
    @{ name="sync_dashboard.png"; url="https://lh3.googleusercontent.com/aida/ADBb0uin39tPFNHZF7HCEe_3GB5pTsYD1EKO8YITpGdfOZtqdMNyn9lXA6nw7ZDnIW-aTbEkPjlsxznomxnVYgiWy-_40qI4SicEixm3IKfpiZxdyUuhcpGYGx-_zB9sZZ5vW6hcaT2BBbEBSwtHL4eu0Y7w_9bDrWfZADysVlOIfL-aaF_yozjQI5usHSiOW3HBXbdCDKcwt2_rVBc6oE2hl8Ao05JOygz3gDyzpnwb0VlwOevW58UQqocGYQ" },
    @{ name="sync_dashboard.html"; url="https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sX2UwN2Y1YjBkNTI2ZDQxZWJiZDU5NTA3NzBkMTg4NjZlEgsSBxCGvsjeqAgYAZIBIgoKcHJvamVjdF9pZBIUQhI1Njk0OTIyMzExNDg3MDg2OTM&filename=&opi=89354086" },
    @{ name="home_capture.png"; url="https://lh3.googleusercontent.com/aida/ADBb0uhY0E3CHG6PnbVEaN4YLHvTR3NCj6u97_l9PL8z_L69iQo8EIfOup5uapxWyYWtI24lDH2vFJWAKh0v2SMBU99f7Wtisn4LTs6KV0CQferIfYBQ1cNe8jxYKP42yDnJNzw6lb_LLqszs5mUOFClQhMLRcs50AJyyOtK4uD8iUHoj8NJx3JBgyoXew4nkGhutBJDdsxNmkyCK-wUTTwe-ZNTMLeonHMo3BNWWJHi1hPIYKj0XJiGK4k27Q" },
    @{ name="home_capture.html"; url="https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzZhZmU1MmUyN2JiMDQzZDhiMDhlMTY4OTFiNDUxYTI2EgsSBxCGvsjeqAgYAZIBIgoKcHJvamVjdF9pZBIUQhI1Njk0OTIyMzExNDg3MDg2OTM&filename=&opi=89354086" },
    @{ name="home_capture_minimal.png"; url="https://lh3.googleusercontent.com/aida/ADBb0ug1p9f9KlIhLjvPyjHDSLQKaeI3ReIcXZ__Buj68QymLRxySmXc9SNeW7TImBbsT9B_G5h2ENIHz9TUQDSXEeWb0zziLCKWAOxx8-XxV_e0QXVVUGS86GEs824lmVTUWSzPBRalRGBFEyXu7H8A9FIM4jCljOxGlSx-LvI0lajk1_5ppLleAzAnzhf6yX09l30aAHYwc-A6KZ7XA39bzDA2nEA6SEo-vx3Nr0jPH3lxRJB6gLDoi0sahw" },
    @{ name="home_capture_minimal.html"; url="https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzNhYzgzY2ZhODE1YTQzNzI4MmU1ODBjNTE4MjEyN2RlEgsSBxCGvsjeqAgYAZIBIgoKcHJvamVjdF9pZBIUQhI1Njk0OTIyMzExNDg3MDg2OTM&filename=&opi=89354086" },
    @{ name="idea_grid_minimal.png"; url="https://lh3.googleusercontent.com/aida/ADBb0ugftaV2PkaLznaGYfinX8TaDaNetn2PNuwGDriizRqboWGyKb5irR2VMmDspzvdZz_mrMODeIw4fb9_7-RGWKFqaKa0dJsPXNY8KnsKFELHsUQf1HUZPyaF60W2Covi1X1OKY9EfXEuE5Ofi8DBdlICVUzSPlzMvBjmuJzQxLtkmQAQaIIWMHACZiDlbHMdRmn6sjoaS1SnCtJdKc6dL8TCFS2wYzGsN4NhQAa0IYHtopEL8ZhiiaZp1w" },
    @{ name="idea_grid_minimal.html"; url="https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ6Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpZCiVodG1sXzZlNWMxODNiYmJjMjRjYmU4OGJkMTEyNGQ4ZmNhNzdlEgsSBxCGvsjeqAgYAZIBIgoKcHJvamVjdF9pZBIUQhI1Njk0OTIyMzExNDg3MDg2OTM&filename=&opi=89354086" }
)

New-Item -ItemType Directory -Force -Path "stitch_assets" | Out-Null
Set-Location "stitch_assets"

foreach ($item in $urls) {
    Write-Host "Downloading $($item.name)..."
    curl.exe -s -L -o $item.name $item.url
}
Write-Host "Done downloading screens."
