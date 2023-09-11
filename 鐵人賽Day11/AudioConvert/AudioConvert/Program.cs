//指定FFmpeg在Linux上的路徑
Xabe.FFmpeg.FFmpeg.SetExecutablesPath("/usr/bin/");

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
//封包壓縮的服務
builder.Services.AddResponseCompression();
//CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

//設定 HTTP 回應壓縮
app.UseResponseCompression();
//CORS
app.UseCors();

app.UseAuthorization();

app.MapControllers();

app.Run();
