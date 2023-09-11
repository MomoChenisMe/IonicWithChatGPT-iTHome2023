//���wFFmpeg�bLinux�W�����|
Xabe.FFmpeg.FFmpeg.SetExecutablesPath("/usr/bin/");

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
//�ʥ]���Y���A��
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

//�]�w HTTP �^�����Y
app.UseResponseCompression();
//CORS
app.UseCors();

app.UseAuthorization();

app.MapControllers();

app.Run();
